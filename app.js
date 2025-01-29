//node --watch 'ruta' truquito del norte
const express = require('express') 
const movies = require('./movies.json')
const cripto = require('node:crypto') //para crear ud unicas
const schema = require('./Schema/movies')
const z = require('zod')
/*
proyectos personales en caso de vainita chilling
const cors = require('cors') --tema de seguridad del navegador
app.use(cors({
    origin: (origin,collback)=>{
        const accept_origin = [
            'http:localhost:1234',
            'http:localhost:5500',
            'http:localhost:1239',
            'http:localhost:1233'
        ]
        if(accept_origin.include(origin)){
            return 'aa'
        }
        if(!origin){
            return 'aa'
        }
        return 'error....'
    }
  

})) */
const { error } = require('node:console')
const app = express()
app.use(express.json())
app.disable('x-powered-by') //deshabilitar el encabezado de x-powered-by
const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'movie  title must be a string'
        }),
        year: z.number().int().min(1900).max(2024),
        director: z.string(),
        duration: z.number().int().positive(),
        rate: z.number().min(0).max(10).default(5),
        poster: z.string().url({
            message: 'poster must be a valid url'
        }),
        genre: z.array(
            z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Crime', 'Anime'])
        )
    })
function validateMovie(object){
    return movieSchema.safeParse(object)
}
function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object) //hara opcional todas las propiedaes, y si esta todo validame
}
app.get('/', (req, res)=>{
    res.json({message: 'hola mundo'})

})
const accept_origin = [
    'http:localhost:1234',
    'http:localhost:5500',
    'http:localhost:1239',
    'http:localhost:1233'
]
app.get('/movies',(req,res)=>{
    const origin = req.header('origin')
    //el navegador nunca envia la origen cuando es del mismo origen
    if(accept_origin.includes(origin) || !origin){
        res.header('Access-Control-Allow', origin)
    }
    res.header('Access-Control-Allow-Origin', '*')
    const {genre} = req.query
    if(genre){
        const filtermovies = movies.filter(
             movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) //hacer la comparacion de los generos todo en minisculas y en el filtro
        )
        return res.json(filtermovies)
    }
    res.json(movies)
})
app.get('/movies/:id',(req,res)=>{ //path-to-regxp
    const {id} = req.params //de la request recuperame el parametro id
    const movie = movies.find(movie => movie.id === id ) //y de la pelicula .id vemos is encontramos la pelicula
    if(movie) return res.json(movie)
    res.status(404).json({message: 'movie not found'})
})
app.post('/movies', (req,res) =>{
    const result = validateMovie(req.body)
    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
   const newMovie ={
        id: cripto.randomUUID(), //te crear un id unica vv4
        ...result.data  
   }
   
    //esto no seria REST, porque estamos guardando
    //el estado de la aplicacion en memoria
   movies.push(newMovie)

   res.status(201).json(newMovie) //se ha conseguido crear el recurso

})
app.patch('/movies/:id', (req, res)=>{
    const result = validatePartialMovie(req.body)
    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    const {id} = req.params //recuperamos el id de req.parame
    const movieIndex = movies.findIndex(movie => movie.id ===id) //buscamos la peliculas
    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }
    const updateMovie ={
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex] = updateMovie
    return res.json(updateMovie)
}) 
app.options('/movies/id:', (req,res)=>{
    const origin = req.header(origin)
    if(!accept_origin.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET' ,'POST', 'PATCH', 'DELETE')
    }
    res.send(200)
})
const PORT = process.env.PORT ?? 1234
app.listen(PORT,()=>{
    console.log(`server listening en port: http://localhost:${PORT}`)
})

/* inempotente: propiedad de realizar una accion determinada varias veces y aun asi consigue siempre el mismo
resultado que se obtendria al hacerlo una vez */


//POST Crear un numero elemento/recurso en el servidor --no es inemptente
//PUT Actualizar totalamente un elemento ya existente o crearlo si no existe --si es inempotente
//Patch Actualizar parcialmente un elemento/recurso --en pricipio si