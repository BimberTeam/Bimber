import express from "express";
import { port } from "./config/config";

const app = express();

app.listen(port, () => {
	return console.log(`Server is listening on ${port}`);
})
.on("error", (err: Error) => {
	console.log(`Encountered error: ${err}`);
});
