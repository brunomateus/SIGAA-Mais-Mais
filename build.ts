// build.ts — empacota src/ em dist/, a pasta carregada no Chrome
import * as esbuild from "esbuild";
import { cpSync, rmSync } from "node:fs";

// Cada funcionalidade acrescenta aqui o seu ponto de entrada: src/entradas/<nome>.ts → dist/<nome>.js
const entryPoints: string[] = [
  "src/entradas/vinculos.ts",
  "src/entradas/popup.ts",
  "src/entradas/paginaInicial.ts",
  "src/entradas/frequencia.ts",
  "src/entradas/chamada.ts",
  "src/entradas/topicos.ts",
];

const options: esbuild.BuildOptions = {
  entryPoints,
  bundle: true,
  format: "iife", // content scripts não aceitam import: cada saída precisa ser autocontida
  target: "chrome120",
  outdir: "dist",
  logLevel: "info",
};

rmSync("dist", { recursive: true, force: true });
cpSync("public", "dist", { recursive: true });

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
