import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { AppDataSource } from "../database/data-source";
import { DicoTerm } from "../entities/Dicoterm";

export const dictionaryRouter = new Hono();

dictionaryRouter.get("/", async (c) => {//récupère la liste de tous les termes du dictionnaire
  try {
    const repo = AppDataSource.getRepository(DicoTerm);

    const terms = await repo.find({//récupre tout les termes de la table (find) 
      order: { nom: "ASC" },//et les trie par ordre alphabétique 
    });

    return c.json(
      {
        success: true,
        data: terms,//temes récupérés
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Echec lors du chargment du dictionnaire" });
  }
});



dictionaryRouter.get("/:slug", async (c) => {// Retourne détail d'un terme à partir de son slug (expl: /dictionary/porosite)
  try {
    const repo = AppDataSource.getRepository(DicoTerm);

   
    const slug = c.req.param("slug"); // récupère le paramètre dans l'URL

    const term = await repo.findOne({
      where: { slug },
    });

    if (!term) {
      throw new HTTPException(404, { message: "Terme introuvable" });// si le terme n'existe pas
    }

    return c.json({ success: true, data: term }, 200);//si ça marche
  } catch (error) {//sinon
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Erreur lors de la récupération du terme" });
  }
});

//POST pour tester que les get marchent dans bruno
dictionaryRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.slug || !body.nom || !body.definition) {
      throw new HTTPException(400, { message: "slug, nom et definition sont obligatoires" });
    }

    const repo = AppDataSource.getRepository(DicoTerm);

    
    const existing = await repo.findOne({ where: { slug: body.slug } });//regarde si deux termes ont le même slug
    if (existing) {//si deux termes sont les mêmes alors :
      throw new HTTPException(409, { message: "Ce slug existe déjà" });
    }

    const term = repo.create({//crée le terme
      slug: body.slug,
      nom: body.nom,
      definition: body.definition,
      categorie: body.categorie ?? null,
      impact: body.impact ?? null,
    });

    const saved = await repo.save(term);

    return c.json({ success: true, data: saved }, 201);//affiche que le success true si réussi 
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Erreur lors de la création du terme" });
  }
});