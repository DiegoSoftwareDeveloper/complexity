const categories = [
    "Electrónica", 
    "Hogar",
    "Deportes",
    "Moda",
    "Juguetes",
    "Herramientas",
    "Libros",
    "Alimentos"
  ];
  
  const cities = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Zaragoza",
    "Málaga",
    "Bilbao",
    "Granada"
  ];
  
  // Función para generar UUID v4
  function generateUUID() {
    return 'uuid_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const products = Array.from({ length: 100 }, (_, index) => {
    const adjective = ["Ergonomico", "Inteligente", "Premium", "Eco", "Profesional", "Deluxe"][getRandomInt(0, 5)];
    const noun = ["Silla", "Mesa", "Teclado", "Monitor", "Zapatilla", "Camiseta"][getRandomInt(0, 5)];
    
    return {
      _id: generateUUID(), // UUID personalizado
      name: `${adjective} ${noun} ${getRandomInt(1, 1000)}`,
      description: `Producto ${index + 1} - Descripción detallada del artículo`,
      category: categories[getRandomInt(0, categories.length - 1)],
      price: getRandomInt(1000, 50000),
      stock: getRandomInt(0, 1000),
      location: cities[getRandomInt(0, cities.length - 1)],
      createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(0, 2)))
    };
  });
  
  try {
    const conn = new Mongo("mongodb://localhost:27017");
    const db = conn.getDB("complexity-dev");
    
    if (db.getCollection("products")) {
      db.products.drop();
    }
    
    const result = db.products.insertMany(products);
    print(`✅ Insertados ${result.length} productos con UUID`);
    conn.close();
  } catch (e) {
    print(`❌ Error: ${e}`);
    quit(1);
  }