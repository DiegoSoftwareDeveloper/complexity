import { Injectable, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ProductEntity } from '../../../domain/entities/product.entity'
import { ProductsRepositoryDomain } from '../../../domain/repositories/products.repository.domain'
import { UtilsSharedService } from '../../../../shared/application/services/utils-shared.service'

@Injectable()
export class ProductsSearchRedisService {
  private readonly INDEX_NAME = 'productsIndex'
  private readonly SUGGESTION_KEY = 'productNames'
  private readonly PRODUCTS_LIST_KEY = 'products:list'

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
        await this.redisClient.call('FT.DROPINDEX', this.INDEX_NAME)
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
        'SEPARATOR',
        '|',
        'location',
        'TAG',
        'SEPARATOR',
        '|',
        'price',
        'NUMERIC',
        'SORTABLE',
        'stock',
        'NUMERIC',
        'createdAt',
        'NUMERIC',
        'SORTABLE',
      )

      console.log('🔄 Índice creado/actualizado correctamente')
    } catch (error) {
      if (!error.message.includes('Index already exists') && !error.message.includes('Unknown Index name')) {
        console.error('Error crítico al crear índice:', error)
        throw error
      }
    }
  }

  async indexProduct(product: ProductEntity): Promise<void> {
    const key = `product:${product._id}`
    await this.redisClient
      .multi()
      .hset(key, {
        //id: product._id,
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
      const result: any = await this.redisClient.call('FT.INFO', this.INDEX_NAME)

      // Buscar el índice de 'num_docs' en el array
      const numDocsIndex = result.indexOf('num_docs')
      if (numDocsIndex === -1) return true

      const numDocs = Number(result[numDocsIndex + 1])
      return numDocs === 0
    } catch (error) {
      if (error.message.includes('Unknown Index name')) {
        console.log('🔍 Redis vacío - Creando índice...')
        await this.createIndex(true) // Forzar recreación
        return true
      }
      throw error
    }
  }

  //Manejo con listas
  /*private async reloadCacheFromMongoDB(): Promise<void> {
    console.log('Recargando caché desde MongoDB...');
  
    try {
      // 1. Limpiar datos y recrear índice
      await this.redisClient.flushdb();
      await this.createIndex(true); // Fuerza recreación
  
      // 2. Obtener productos
      const [products, err] = await this._productsRepository.base.find();
      this._utilsSharedService.checkErrDatabaseThrowErr({ err });
      console.log(`📦 Productos encontrados: ${products.length}`);
  
      // 3. Insertar con pipeline
      const pipeline = this.redisClient.pipeline();
  
      products.forEach(product => {
        const key = `product:${product._id}`;
        
        // Validar campos requeridos
        if (!product._id || !product.name) {
          console.error('Producto inválido:', product);
          return;
        }
  
        // Insertar documento
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
  
        // Agregar sugerencia
        pipeline.call('FT.SUGADD', this.SUGGESTION_KEY, product.name, 1);

        pipeline.rpush(this.PRODUCTS_LIST_KEY, JSON.stringify({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          createdAt: product.createdAt.getTime(),
          // Include only the fields you need for list operations
        }));
      });
  
      // 4. Ejecutar operaciones
      const results = await pipeline.exec();
      
      // 5. Verificar resultados
      const successCount = results.filter(([err]) => !err).length;
      console.log(`✅ Operaciones exitosas: ${successCount}/${products.length * 2}`);
  
      // 6. Sincronizar índice
      await this.redisClient.call('FT.SYNUPDATE', this.INDEX_NAME);
  
      // 7. Verificar documentos
      const numDocs = await this.redisClient.call('FT.INFO', this.INDEX_NAME)
        .then((res: any[]) => Number(res[res.indexOf('num_docs') + 1]));
      console.log(`📊 Documentos en Redis: ${numDocs}`);

      await this.redisClient.expire(this.INDEX_NAME, 3600);
      await this.redisClient.expire(this.SUGGESTION_KEY, 3600);
      await this.redisClient.expire(this.PRODUCTS_LIST_KEY, 3600);
  
    } catch (error) {
      console.error('🔥 Error crítico:', error);
      throw error;
    }
  }*/

  private async reloadCacheFromMongoDB(): Promise<void> {
    console.log('V2 Recargando caché desde MongoDB...')

    try {
      await this.redisClient.flushdb()
      await this.createIndex()

      const [products, err] = await this._productsRepository.base.find()
      this._utilsSharedService.checkErrDatabaseThrowErr({ err })

      console.log(`Encontrados ${products.length} productos en MongoDB`)

      const pipeline = this.redisClient.pipeline()

      for (const product of products) {
        const key = `product:${product._id.toString()}`
        pipeline.hset(key, {
          //id: product._id,
          name: product.name,
          description: product.description || '',
          category: product.category,
          location: product.location,
          price: product.price.toString(),
          stock: product.stock.toString(),
          createdAt: product.createdAt.getTime().toString(),
        })

        // Opcional: agregar sugerencia
        pipeline.call('FT.SUGADD', this.SUGGESTION_KEY, product.name, 1)
      }

      // Ejecutar todos los comandos en un solo lote
      const results = await pipeline.exec()

      //console.log(results)

      const successCount = results.filter(([err]) => !err).length
      console.log(`✅ Operaciones exitosas: ${successCount}/${products.length * 2}`)

      //await this.redisClient.call('FT.SYNUPDATE', this.INDEX_NAME)
      await this.redisClient.expire(this.INDEX_NAME, 3600)
      await this.redisClient.expire(this.SUGGESTION_KEY, 3600)

      const numDocs = await this.redisClient
        .call('FT.INFO', this.INDEX_NAME)
        .then((res: any[]) => Number(res[res.indexOf('num_docs') + 1]))

      console.log(`📦 Documentos en Redis: ${numDocs}`)
    } catch (error) {
      console.error('🚨 Error en sincronización Redis-MongoDB:', error)
      throw error
    }
  }

  async searchProducts(
    query: string,
    filters: { category?: string; location?: string },
    pagination: { offset: number; limit: number },
  ): Promise<any[]> {
    console.log('Iniciando búsqueda...')
    if (await this.checkRedisEmpty()) {
      console.log('🔍 Redis vacío - Sincronizando desde MongoDB...')
      await this.reloadCacheFromMongoDB()
    }
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
      await this.reloadCacheFromMongoDB()
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
