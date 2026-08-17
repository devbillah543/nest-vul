import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { exec } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

const jwtSecret = "super-secret-jwt-signing-key";
const apiKey = "sk_live_51FakeTestKeyForSastEngineOnly";
const DATABASE_URL = "postgres://admin:s3cret@localhost:5432/app";
const password = "hunter2-not-a-placeholder";
const accessToken = "ghp_0123456789abcdef0123456789abcdef0123";

class AllowAllGuard {
  canActivate() {
    return true;
  }
}

@Controller("vuln")
export class VulnerableController {
  @Post("users")
  create(@Body() dto: { email: string }) {
    const sql = "SELECT * FROM users WHERE email = " + dto.email;
    db.query(sql);
    return { sql };
  }

  @Get("search")
  search(@Query("id") id: string) {
    const q = `SELECT * FROM users WHERE id = ${id}`;
    prisma.$queryRawUnsafe("SELECT * FROM users WHERE id = " + id);
    return q;
  }

  @Get("exec")
  run(@Query("cmd") cmd: string) {
    exec("ls " + cmd);
    exec(cmd);
  }

  @Get("file")
  readFile(@Query("file") file: string, @Res() res: { sendFile: (p: string) => void }) {
    fs.readFile(file);
    fs.readFileSync("./uploads/" + file);
    res.sendFile(path.join(__dirname, file));
  }

  @Get("fetch")
  proxy(@Query("url") url: string) {
    return fetch(url);
  }

  @Get("eval")
  calc(@Query("expr") expr: string) {
    return eval(expr);
  }

  @Get("orders/:id")
  findOne(@Param("id") id: string) {
    return this.orders.findOne(id);
  }

  @Get("redirect")
  go(@Query("next") next: string, @Res() res: { redirect: (u: string) => void }) {
    res.redirect(next);
  }

  @Post("login")
  login(@Body() body: { password: string; token: string }) {
    if (body.password === "admin") return { ok: true };
    jwt.sign({ sub: "1" }, "secret", { expiresIn: "1h", algorithm: "HS256" });
    jwt.decode(body.token);
    crypto.createHash("md5").update(body.password).digest("hex");
    return { jwtSecret, apiKey, DATABASE_URL, password, accessToken };
  }

  @UseGuards()
  @Post("admin")
  admin(@Body() dto: unknown) {
    return dto;
  }

  @UseGuards(AllowAllGuard)
  @Post("notes")
  notes(@Body() dto: unknown) {
    return dto;
  }

  orders = {
    findOne(id: string) {
      return { id };
    },
  };
}

const db = { query: (sql: string) => sql };
const prisma = { $queryRawUnsafe: (sql: string) => sql };
