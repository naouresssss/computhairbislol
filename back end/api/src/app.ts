import { Hono } from "hono";
import { usersRouter } from "./routes/users";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profile";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { dictionaryRouter } from "./routes/dictionnary";//import la route du dictionnaire 

const app = new Hono();

app.get("/health", (c) => c.text("ok"));
app.get("/", (c) => c.text("Bienvenu sur Computhair"));

app.route("/users", usersRouter);
app.route("/auth", authRouter);
app.route("/profile", profileRouter);
app.route("/dictionary", dictionaryRouter);

// Catch All Errors
app.onError((error: Error, c) => {
  if (error instanceof HTTPException) {
    return c.json(
      { success: false, message: error.message ?? "An error has occurred" },
      error.getResponse().status as ContentfulStatusCode
    );
  }

  console.error(error);
  return c.json({ success: false, message: "An error has occurred" }, 500);
});
export default app;
