// crée le profile capillaire après avir répondu au questionnaire pour créer compte
import { Hono } from "hono";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AppDataSource } from "../database/data-source";
import { ProfilCapillaire } from "../entities/Profilcapillaire";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export const profileRouter = new Hono();
profileRouter.post("/", async (c) => {
  // récupére le token du user
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ message: "No token" }, 401);

  const token = authHeader.split(" ")[1];

  // vérifier token bon et récupérer id de l'user pour les connecter
  let userId: number;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };
    userId = payload.userId;
  } catch {
    return c.json({ message: "token invalide" }, 401);
  }

  const body = await c.req.json();

  // petit check que tou est répondu
  if (
    !body.type ||
    !body.etatGeneral ||
    !body.cuirChevelu ||
    !body.traitementChimique ||
    !body.objectifs
  ) {
    return c.json({ message: "Il manque des champs" }, 400);
  }

  // récupére le user
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) return c.json({ message: "Utilisateur pas trouvé" }, 404);

  // crée et sauvegarder le profil d'un user
  const profileRepo = AppDataSource.getRepository(ProfilCapillaire);

  const existingProfile = await profileRepo.findOne({//vérifie si y a pas un profil déjà pour ce user (donc s'il a pas déjà rempli questionnaire pour éviter les erreurs)
    where: { user: { id: userId } },
  });

  if (existingProfile) {
    return c.json({ message: "Profil déjà créé" }, 400);
  }

  const profile = profileRepo.create({
    type: body.type,
    etatGeneral: body.etatGeneral,
    cuirChevelu: body.cuirChevelu,
    traitementChimique: body.traitementChimique,
    objectifs: body.objectifs,
    user,
  });

  //save le profil du user
  const saved = await profileRepo.save(profile);

  return c.json(saved, 201);
});

profileRouter.get("/", async (c: Context) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Token manquant ou invalide" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const userId = decoded.userId;

    const repo = AppDataSource.getRepository(ProfilCapillaire);

    const profile = await repo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new HTTPException(404, { message: "Profil introuvable" });
    }

    return c.json({ success: true, data: profile }, 200);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: "Erreur lors de la récupération du profil",
    });
  }
});
