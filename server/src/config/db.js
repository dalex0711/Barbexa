import {createPool} from 'mysql2/promise'
import { config }  from './index.js'

export const pool = createPool({
    host: config.bd.host,
    user: config.bd.user,
    password: config.bd.password,
    database: config.bd.database,
    port: config.bd.port || 3306
})
