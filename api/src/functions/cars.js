const { app } = require('@azure/functions');
const { error } = require('console');
const fs = require('fs')
let cars = [];

const getAllCars = async () => {
    try {
        // Read from file, parse data and send back
        const data = fs.readFileSync('cars.json')
        cars = JSON.parse(data)
        return {
            status: 200,
            body: data
        };
    } catch (error) { // Error message 
        return {
            status: 400,
            body: JSON.stringify({
                error: error.message
            })
        }
    }
}

const createCar = async (car) => {
    try {
        // Just something simple to create unique Car IDs
        if (cars.length > 0) {
            car.id = Math.max(...cars.map(car => car.id))+1
        } else {
            car.id = 0
        }

        // Add car to list
        cars.push(car)
        
        // Write back to the file
        fs.writeFile('cars.json', JSON.stringify(cars), (error) => {return {status: 400, body: JSON.stringify({error: error})}})

        // Return successful
        return {
            status: 200,
            body: JSON.stringify({
                message: `Car ${car.id} added succesffuly`
            })
        }                  
    } catch (error) { // Error message
        return {
            status: 400,
            body: JSON.stringify({
                error: error
            })
        }
    }
    
}

const deleteCar = async (carId) => {
    try {
        // Find the car to delete
        const car = cars.find(car => car.id == carId)
        if (car) {
            const index = cars.indexOf(car)

            // Delete the car
            cars.splice(index, 1)

            // Write back to the file
            fs.writeFile('cars.json', JSON.stringify(cars), (error) => {return {status: 400, body: JSON.stringify({error: error})}})

            // Return successful
            return {
                status: 200,
                body: JSON.stringify({
                    message: `Car ${carId} deleted succesffuly`
                })
            }   
        } else {
            return { // Error if car not found
                status: 400,
                body: JSON.stringify({
                    error: `Car ${carId} not found`
                })
            }
        }
    } catch (error) { // Error message
        return {
            status: 400,
            body: JSON.stringify({
                error: error.message
            })
        }
    }
}

// GET and POST requests to cars
app.http('cars', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'GET') {
            return getAllCars();
        } else if (request.method === 'POST') {
            const car = await request.json()
            return createCar(car);
        }
    }
});

// DELETE request to cars/{id}
app.http('carsdelete', {
    route: 'cars/{id}',
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const carId = request.params.id
        return deleteCar(carId)
    }
})
