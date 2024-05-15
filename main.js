// import { File, FormData } from "formdata-node";
// import fs from "fs";
// import fetch from "node-fetch";
const { File, FormData } = require("formdata-node");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("node:fs");

(async () => {
    const initImage = new File(
        [fs.readFileSync("/Users/sanjaychandrasekaren/Documents/Projects/react/sampleProject/image-diffusion-poc/image.jpeg")],
        "image.jpeg"
    );
    // Call the image_to_image API to transform the image
    const formData = new FormData();
    // This is for Node.js. If in browser, adjust accordingly.
    formData.append("init_image", initImage);
    formData.append("prompt", `Comic book illustration of a superhero avatar inspired by the uploaded picture. The subject has a confident, determined expression, heroic eyes, glowing skin. Their neatly groomed hair is swept back

Background: Bustling cityscape bathed in warm afternoon sunlight, towering skyscrapers, and streets teeming with people.

Subject Details: Powerful, athletic physique conveying strength and resilience. Strong, commanding posture radiating confidence. 

Capture the essence of the person in the picture, translating features into a superhero persona. Facial expression reflects a fighter's determination and unwavering resolve. 

Mimic the bold lines and dynamic compositions of classic comic book illustrations.`);
    formData.append("negative_prompt", "worst quality, bad eyes, bad anatomy, cropped, cross eyed, ugly, deformed, glitch, mutated, worst quality, unprofessional, low quality");
    formData.append("init_image_mode", "IMAGE_STRENGTH");
    formData.append("image_strength", "0.2");
    formData.append("cfg_scale", 20);
    formData.append("seed", 0);
    formData.append("steps", 30);
    formData.append("safety_check", false);

    const response = await fetch("https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image", {
    method: 'POST',
    headers: {
        'Accept': 'image/jpeg',
        'Authorization': `Bearer `,
    },
    body: formData,
    });

    // To process the response and get the image:
    const buffer = await response.arrayBuffer();

    fs.writeFile('comic.jpg', Buffer.from(buffer), () => console.log('finished downloading!'));
})().catch(console.error);