// Desafio 2
const fs = require("fs").promises;

class ProductManager {
    // Variable para llevar un seguimiento del último id asignado
    static ultId = 0;

    constructor(path) {

        // Inicializa el array de productos y la ruta del archivo
        this.path = path;
        this.products = [];
    }
    // Método para agregar un nuevo producto al array y guardar en el archivo
    async addProduct(nuevoObjeto) {
        if (!nuevoObjeto) {
            console.error("El objeto es undefined o null");
            return;
        }

        let { title, description, price, thumbnails, code, stock } = nuevoObjeto;

        // Validaciones
        if (![title, description, price, code, stock, thumbnails].every(Boolean)) {
            console.error("Todos los campos son obligatorios");
            return;
        }
        if (this.products.some(item => item.code === code)) {
            console.error("El código debe ser único");
            return;
        }

        // Crear nuevo producto con id autoincrementable
        const newProduct = {
            id: ++ProductManager.ultId,
            title,
            description,
            code,
            price,
            stock,
            thumbnails,
        };

        // Agregar producto al array
        this.products.push(newProduct);

        // Guardar el array actualizado en el archivo
        await this.saveFile();
        console.log("Producto agregado:", newProduct);
    }

    // Método para obtener todos los productos
    getProducts() {
        console.log("getProducts:", this.products);
        return this.products;
    }

    // Método para obtener un producto por su id
    async getProductById(id) {
        try {
            const arrayProductos = await this.readFile();
            const buscado = arrayProductos.find(item => item.id === id);

            if (!buscado) {
                console.log("Producto no encontrado");
            } else {
                console.log("Producto encontrado:", buscado);
                return buscado;
            }
        } catch (error) {
            console.log("Error al leer el archivo", error);
        }
    }

    // Método para actualizar un producto por su id
    async updateProduct(id, updatedProduct) {
        try {
            const arrayProductos = await this.readFile();

            const index = arrayProductos.findIndex(item => item.id === id);

            if (index !== -1) {
                updatedProduct = this.reformatProduct(updatedProduct, arrayProductos[index])
                // Utilizo el método de array splice para reemplazar el objeto en la posición del index
                arrayProductos.splice(index, 1, updatedProduct);
                await this.saveFile(arrayProductos);
                console.log("Producto actualizado:", updatedProduct);
            } else {
                console.log("No se encontró el producto, no se puede actualizar");
            }
        } catch (error) {
            console.log("Error al actualizar el producto", error);
        }
    }
    reformatProduct(newParams, oldProduct) {
        const updatedProduct = {
            "id": oldProduct.id,
            "title": newParams.title ?? oldProduct.title,
            "description": newParams.description ?? oldProduct.description,
            "code": newParams.code ?? oldProduct.code,
            "price": newParams.price ?? oldProduct.price,
            "stock": newParams.stock ?? oldProduct.stock,
            "thumbnails": newParams.thumbnails ?? oldProduct.thumbnails,
        };

        return updatedProduct;
    }

    // Método para eliminar un producto por su id
    async deleteProduct(id) {
        try {
            const arrayProductos = await this.readFile();
            id = parseInt(id)
            const index = arrayProductos.findIndex(item => item.id === id);


            if (index !== -1) {
                // Utilizo el método de array splice para eliminar el objeto en la posición del index
                arrayProductos.splice(index, 1);
                await this.saveFile(arrayProductos);
                console.log("Producto eliminado satisfactoriamente");
            } else {
                console.log("No se encontró el producto");
            }
        } catch (error) {
            console.log("Error al eliminar el producto", error);
        }
    }

    // Método para leer el archivo
    async readFile() {
        try {
            const respuesta = await fs.readFile(this.path, "utf-8");
            const arrayProductos = JSON.parse(respuesta);
            return arrayProductos;
        } catch (error) {
            console.log("Error al leer un archivo", error);
        }
    }

    // Método para guardar el array actualizado en el archivo
    async saveFile(arrayProductos = this.products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
        } catch (error) {
            console.log("Error al guardar el archivo", error);
        }
    }
}


/** productos de prueba **/

const productIncomplete = {
    "title": "Barrita de Cereal B",
    "description": "Barrita de avena con trozos de chocolate",
    "price": 2.49,
    "code": "BC002",
}
const product = {
    "title": "producto prueba",
    "description": "Este es un producto prueba",
    "price": 200,
    "code": "abc123",
    "stock": 25,
    "thumbnails": "Sin imagen",
}
const product2 = {
    "title": "Barrita de Cereal C",
    "description": "Barrita energética con frutos secos",
    "price": 2.99,
    "code": "codeUnique",
    "stock": 20,
    "thumbnails": "barritaC.png",
}


//----> testing
//se crea la intancia de Product Manager para realizar los diferentes tests
const productManager = new ProductManager("./Products.JSON")

productManager.getProducts(); // deberia devolver un array vacio.


async function testAddProducts() {
    /* Se agrega un producto valido 
    - El objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE 
    - Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado*/
    await productManager.addProduct(product);
    await productManager.addProduct(product2); // deberia auto incrementar el Id sin problemas.
    await productManager.addProduct(product2); // deberia devolver error ya que el code es repetido 
    productManager.getProducts(); // deberia devolver un array con un producto.

}
//testAddProducts();


//Se llamará al método “getProductById” y se corroborará que devuelva el producto con el id especificado, en caso de no existir, debe arrojar un error.
async function testGetProductById() {
    await productManager.getProductById(1); // deberia encontrar el producto.
    await productManager.getProductById(3); // este id no existe no deberia encontrar el producto.
}
//testGetProductById();


async function testUpdateProduct() {
    //Se llamará al método “updateProduct” y se intentará cambiar un campo de algún producto, se evaluará que no se elimine el id y que sí se haya hecho la actualización.
    await productManager.updateProduct(3, productIncomplete) //  no podra actualizar ya que el id no existe 
    await productManager.updateProduct(1, productIncomplete) //  actualiza los campos correctamente sin modificar el id
}

//testUpdateProduct()



//Se llamará al método “deleteProduct”, se evaluará que realmente se elimine el producto o que arroje un error en caso de no existir.
async function testDeleteProduct() {
    await productManager.deleteProduct(3) //  no podra eliminar ya que el id no existe 
    await productManager.deleteProduct(2)//  elimina el producto con id 2 del archivo Products.JSON
}

//testDeleteProduct();
