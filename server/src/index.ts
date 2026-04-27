import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

dotenv.config()

const app = express()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// test route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

// CREATE item
app.post("/api/items", async (req, res) => {
  const { name, quantity } = req.body

  const item = await prisma.item.create({
    data: {
      name,
      quantity,
    },
  })

  res.json(item)
})

// READ all items
app.get("/api/items", async (_req, res) => {
  const items = await prisma.item.findMany()
  res.json(items)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})