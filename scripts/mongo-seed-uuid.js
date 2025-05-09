//mongo --quiet scripts/mongo-seed-uuid.js
const { MongoClient, UUID } = require('mongodb')

// Genera un UUID válido usando el tipo Binary
function generateUUID() {
  return new UUID() // MongoDB genera un UUID válido con el tipo Binary
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const categories = ['Electrónica', 'Hogar', 'Deportes', 'Moda', 'Juguetes', 'Herramientas', 'Libros', 'Alimentos']
const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Granada']

const products = Array.from({ length: 100 }, (_, index) => {
  const adjective = ['Ergonomico', 'Inteligente', 'Premium', 'Eco', 'Profesional', 'Deluxe'][getRandomInt(0, 5)]
  const noun = ['Silla', 'Mesa', 'Teclado', 'Monitor', 'Zapatilla', 'Camiseta'][getRandomInt(0, 5)]

  return {
    _id: generateUUID(), // UUID real
    name: `${adjective} ${noun} ${getRandomInt(1, 1000)}`,
    description: `Producto ${index + 1} - Descripción detallada del artículo`,
    category: categories[getRandomInt(0, categories.length - 1)],
    price: getRandomInt(1000, 50000),
    stock: getRandomInt(0, 1000),
    location: cities[getRandomInt(0, cities.length - 1)],
    createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(0, 2))),
  }
})

// Conectar a MongoDB
async function run() {
  const uri = 'mongodb://localhost:27017' // URL de la base de datos
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('complexity-dev') // Nombre de la base de datos
    const collection = db.collection('products')

    // Si la colección ya existe, la eliminamos
    await collection.drop().catch((err) => console.log('Colección no existe o no se pudo eliminar'))

    // Insertar productos
    const result = await collection.insertMany(products)
    console.log(`✅ Insertados ${result.insertedCount} productos con UUID`)
  } catch (e) {
    console.error(`❌ Error: ${e}`)
  } finally {
    await client.close()
  }
}

run()
