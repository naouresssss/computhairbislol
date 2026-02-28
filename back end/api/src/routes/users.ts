import { Hono } from "hono";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const usersRouter = new Hono();

usersRouter.post("/", async (c) => {
  const body = await c.req.json();
  const hashedPassword = await bcrypt.hash(body.mdp, 11); //crypte le mdp
  const repo = AppDataSource.getRepository(User);

  //créer et sauvgarde un utilisateur
  const user = repo.create({
    email: body.email,
    mdp: hashedPassword,
    prenom: body.prenom,
    dateinscription: body.dateinscription,
  });

  const savedUser = await repo.save(user);

  return c.json(savedUser, 201);
});

usersRouter.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {//vérifie qu'il y a un header avec un Bearer
      throw new HTTPException(401, { message: "Token manquant ou invalide" });
    }
    const token = authHeader.split(" ")[1];//récupère le token (liste de 2 élèments Bearer + token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {//véifie que le token existe et qu'il correspond
      userId: number;
    };
    const userId = decoded.userId;

    const repo = AppDataSource.getRepository(User);

    const user = await repo.findOne({
      where: { id: userId },//récupère les data de l'user qui a l'id qui correspond
    });

    if (!user) {
      throw new HTTPException(404, { message: "Utilisateur introuvable" });//si user exite pas 
    }
    

    return c.json({ success: true }, 200);
  } catch (error) {//tout autre erreur
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: "Erreur lors de la récupération de l'utilisateur",
    });
  }
});
