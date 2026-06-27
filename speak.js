import { exec } from "child_process";

const message = "Hello. I am Persona X. Speaker test successful.";

exec(`say "${message}"`, (error) => {
  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Speech finished!");
});