import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");//donne le contenu du header Authorization

  if (!authHeader) {
    return c.json({ message: "No token" }, 401);
  }

  const token = authHeader.split(" ")[1];//pour séparer le bearer du token et récupérer le token tout seul

  if (!token) {
    return c.json({ message: "No token" }, 401);//si pas de token retourne 401 
  }

  //Verifie du token
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: number };//stock l'id du user trouvé dans le token (s'il est bon)

    c.set("userId", payload.userId);//le rajoute au contexte
    
    await next(); //laisse passer vers la route

  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
};