import { Injectable, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ProductEntity } from '../../../domain/entities/product.entity'
import { ProductsRepositoryDomain } from '../../../domain/repositories/products.repository.domain'
import { UtilsSharedService } from '../../../../shared/application/services/utils-shared.service'

@Injectable()
export class ProductsSearchRedisService {
  private readonly INDEX_NAME = 'productsIndex'
  private readonly SUGGESTION_KEY = 'productNames'

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly _productsRepository: ProductsRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {
    this.createIndex()
  }

  private async createIndex(force = false) {
    try {
      // Eliminar índice existente si se fuerza
      if (force) {
        await this.redisClient.call('FT.DROPINDEX', this.INDEX_NAME);
      }

      await this.redisClient.call(
        'FT.CREATE',
        this.INDEX_NAME,
        'ON',
        'HASH',
        'PREFIX',
        '1',
        'product:',
        'SCHEMA',
        'name',
        'TEXT',
        'WEIGHT',
        '5.0',
        'NOSTEM',
        'description',
        'TEXT',
        'category',
        'TAG',
        'CASESENSITIVE',
        'location',
        'TAG',
        'price',
        'NUMERIC',
        'SORTABLE',
        'stock',
        'NUMERIC',
        'createdAt',
        'NUMERIC',
        'SORTABLE',
      )
    } catch (error) {
      if (!error.message.includes('Index already exists') && 
          !error.message.includes('Unknown Index name')) {
        console.error('Error crítico al crear índice:', error);
        throw error;
      }
    }
  }

  async indexProduct(product: ProductEntity): Promise<void> {
    const key = `product:${product._id}`
    await this.redisClient
      .multi()
      .hset(key, {
        id: product._id,
        name: product.name,
        description: product.description || '',
        category: product.category,
        location: product.location,
        price: product.price.toString(),
        stock: product.stock.toString(),
        createdAt: product.createdAt.getTime().toString(),
      })
      .call('FT.SUGADD', this.SUGGESTION_KEY, product.name, 1)
      .exec()
  }

  private async checkRedisEmpty(): Promise<boolean> {
    try {
      const result: any = await this.redisClient.call('FT.INFO', this.INDEX_NAME);
      
      // Buscar el índice de 'num_docs' en el array
      const numDocsIndex = result.indexOf('num_docs');
      if (numDocsIndex === -1) return true;
      
      const numDocs = Number(result[numDocsIndex + 1]);
      return numDocs === 0;
      
    } catch (error) {
      if (error.message.includes('Unknown Index name')) {
        await this.createIndex(true); // Forzar recreación
        return true;
      }
      throw error
    }
  }

  private async reloadCacheFromMongoDB(): Promise<void> {
    console.log('Recargando caché desde MongoDB...');
    
    try {
      // Limpiar datos existentes
      await this.redisClient.flushdb();
  
      // Crear índice nuevamente
      await this.createIndex();

      // 2. Obtener todos los productos
      const [products, err]= await this._productsRepository.base.find();
      this._utilsSharedService.checkErrDatabaseThrowErr({ err })

      console.log(`Encontrados ${products.length} productos en MongoDB`);
  
      // Usar pipeline para inserción masiva
      const pipeline = this.redisClient.pipeline();
      
      products.forEach(product => {
        const key = `product:${product._id}`;
        pipeline.hset(key, {
          id: product._id,
          name: product.name,
          description: product.description || '',
          category: product.category,
          location: product.location,
          price: product.price.toString(),
          stock: product.stock.toString(),
          createdAt: product.createdAt.getTime().toString(),
        });
        pipeline.call('FT.SUGADD', this.SUGGESTION_KEY, product.name, 1);
      });
  
      // Ejecutar todas las operaciones
      await pipeline.exec();
      console.log(`🔄 ${products.length} productos sincronizados en Redis`);
  
      // Verificar datos insertados
      const numDocs = await this.redisClient.call('FT.INFO', this.INDEX_NAME)
        .then((res: any[]) => Number(res[res.indexOf('num_docs') + 1]));
        
      console.log(`Documentos en Redis: ${numDocs}`);
  
    } catch (error) {
      console.error('🚨 Error en sincronización Redis-MongoDB:', error);
      throw error;
    }
  }
  /*private async reloadCacheFromMongoDB(): Promise<void> {
    console.log('reloading cache from MongoDB');
    const products = await this._productsRepository.base.find();

    console.log(products.length)
    
    await Promise.all(
      products.map(product => this.indexProduct(product))
    )

    await this.redisClient.expire(this.INDEX_NAME, 3600); // Expira en 1 hora
    await this.redisClient.expire(this.SUGGESTION_KEY, 3600);
  }*/

  async searchProducts(
    query: string,
    filters: { category?: string; location?: string },
    pagination: { offset: number; limit: number },
  ): Promise<any[]> {
    console.log('entrando....')
    // Verificar si Redis está vacío
    const t = await this.checkRedisEmpty()
    console.log(t)
    if (await this.checkRedisEmpty()) {
      console.log('entro a checkRedisEmpty');
      await this.reloadCacheFromMongoDB();
    }
    console.log('continuiando....')

    //construye la consulta de busqueda
    let searchQuery = `@name:(${query}*) | @description:(${query}*)`
    const filterParts = []

    if (filters.category) filterParts.push(`@category:{${filters.category}}`)
    if (filters.location) filterParts.push(`@location:{${filters.location}}`)

    if (filterParts.length > 0) {
      searchQuery += ` ${filterParts.join(' ')}`
    }

    //realiza la busqueda
    const rawResults = (await this.redisClient.call(
      'FT.SEARCH',
      this.INDEX_NAME,
      searchQuery,
      'LIMIT',
      pagination.offset.toString(),
      pagination.limit.toString(),
      'SORTBY',
      'createdAt',
      'DESC',
    )) as unknown[]

    return this.parseSearchResults(rawResults)
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    if (await this.checkRedisEmpty()) {
      await this.reloadCacheFromMongoDB();
    }

    return this.redisClient.call('FT.SUGGET', this.SUGGESTION_KEY, query, 'FUZZY', 'MAX', limit.toString()) as Promise<
      string[]
    >
  }

  private parseSearchResults(rawResults: unknown[]): any[] {
    const results = []
    for (let i = 1; i < rawResults.length; i += 2) {
      const productData = rawResults[i + 1] as string[]
      const product = { id: rawResults[i] }
      for (let j = 0; j < productData.length; j += 2) {
        product[productData[j]] = productData[j + 1]
      }
      results.push(product)
    }
    return results
  }

  async updateProduct(product: ProductEntity): Promise<void> {
    await this.indexProduct(product)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.redisClient.del(`product:${id}`)
    await this.redisClient.call('FT.SUGDEL', this.SUGGESTION_KEY, id)
  }
}
