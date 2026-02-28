import { Hono } from "hono";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middlewares/authorizationm";
import { ProfilCapillaire } from "../entities/Profilcapillaire";

type Variables = {
  userId: number;
};

export const authRouter = new Hono<{ Variables: Variables }>();
authRouter.post("/login", async (c) => {
  const body = await c.req.json();

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ email: body.email });

  if (!user) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const ok = await bcrypt.compare(body.mdp, user.mdp);
  if (!ok) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return c.json({ token });
});

authRouter.post("/signup", async (c) => {
  //pour s'inscrire s'ila pas de compte
  const body = await c.req.json();

  const prenom = body.prenom ?? body.pseudo; //prénom ou pseudo du user

  if (!body.email || !body.mdp || !body.confirmMdp || !prenom) {
    return c.json({ message: "Champs manquants" }, 400); //il faut remplir mail, mdp, confirmation mdp, et prenom
  }

  if (body.mdp !== body.confirmMdp) {
    return c.json({ message: "Les mots de passe ne correspondent pas" }, 400); //si les mdp ne sont pas les même
  }

  const repo = AppDataSource.getRepository(User);

  const existing = await repo.findOneBy({ email: body.email }); //vérifie que un compte avce cette email existe pas déjà dans la DB
  if (existing) {
    return c.json({ message: "Email déjà utilisé" }, 409);
  }

  const hashedPassword = await bcrypt.hash(body.mdp, 11); //crypte le mdp

  const user = repo.create({
    //crée le user
    email: body.email,
    mdp: hashedPassword,
    prenom: prenom,
  });

  const savedUser = await repo.save(user); //sauvegarde le user

  const token = jwt.sign(
    //vérifie que le token est bon
    { userId: savedUser.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return c.json({ token, mustCompleteProfile: true }, 201);
});

authRouter.get("/me", requireAuth, async (c) => {
  //vérifie que le token est bon avce requireAuth, si bon met userID dans le context c
  const userId = c.get("userId"); //récupère le userId
  const userRepo = AppDataSource.getRepository(User); //donneaccès à la table user pour faire requêtes
  const profileRepo = AppDataSource.getRepository(ProfilCapillaire);

  const user = await userRepo.findOneBy({ id: userId }); //cherche le user avec l'id correspondant
  if (!user) {
    return c.json({ message: "Utilisateur introuvable" }, 404); //vérifie que user exite
  }

  const profile = await profileRepo.findOne({
    //cehrche si y a un profil capillaire pour ce user
    where: { user: { id: userId } },
  });

  return c.json({ user, mustCompleteProfile: !profile });//false si questionnaire répondu, true sinon
});
