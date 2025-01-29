const z = require('zod')
const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'movie  title must be a string'
        }),
        year: z.number().int().min(1900).max(2024),
        director: z.string(),
        rate: z.number().min(0).max(10),
        poster: z.string().url({
            message: 'poster must be a valid url'
        }),
        genre: z.array(
            z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', ''])
        )
    })
function validateMovie(object){
    return movieSchema.safeParse(object)
}

   /*
const {
    title,
    genre,
    year,
    director,
    duration,
    rate,
    poster

} = req.body //nos trae el cuerpo de la la reqs ya decodificado y para poder usarlo se usa app.use(Express.json()) */