const axios = require("axios");
// const FormData = require("form-data");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const { spawn } = require('child_process');
const bodyParser =require('body-parser')
const { Blob } = require("buffer");
const PORT = 4000;
const { File, FormData } = require("formdata-node");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const multer = require('multer');
const upload = multer();

app.use(cors());
app.use(
    bodyParser.raw({ limit: '50mb', type: ['image/*'] })
);

app.get('/prompt-image-generation', async (req, res, next) => {
    const formData = {
        prompt: "A anime character sitting in beach looking at people walking",
        output_format: "webp"
    };

    const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/core`,
        axios.toFormData(formData, new FormData()),
        {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: {
                Authorization: `Bearer `,
                Accept: "image/*"
            },
        },
    );

    if (response.status === 200) {
        fs.writeFileSync("./anime.webp", Buffer.from(response.data));
        res.send("Sucessfully Generated!!").sendStatus(200);
    } else {
        res.sendStatus(500);
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
});

app.post('/diffusion-image-generation', async (req, res, next) => {
    try {
        console.log( req.body, req.body.buffer, typeof Buffer.from(req.body).toString('base64'));
        const buff = Buffer.from(req.body); // Node.js Buffer
        const blob = new Blob([buff]); 
        console.log(blob);
        const formData = new FormData();
        formData.append('image', buff, { filename: 'image.jpg' });
        formData.append('mode', 'image-to-image');
        formData.append('model', 'sd3');
        formData.append('strength', 0.85);
        formData.append('prompt', `Comic book illustration of a superhero avatar inspired by the uploaded picture. The subject has a confident, determined expression with piercing, heroic eyes. Their neatly groomed hair is short.

        Background: Bustling cityscape bathed in warm afternoon sunlight, towering skyscrapers, and streets teeming with people.
        
        Subject Details: Powerful, athletic physique conveying strength and resilience. Strong, commanding posture radiating confidence. 
        
        Capture the essence of the person in the picture, translating features into a superhero persona. Facial expression reflects a fighter's determination and unwavering resolve. 
        
        Mimic the bold lines and dynamic compositions of classic comic book illustrations.`);
        formData.append('output_format', 'png');
        formData.append('negative_prompt', 'worst quality, bad eyes, bad anatomy, cropped, cross eyed, ugly, deformed, glitch, mutated, worst quality, unprofessional, low quality')
        // const formData = {
        //     image: buff,
        //     prompt: "generate anime version of the picture",
        //     output_format: "jpeg",
        //     mode: "image-to-image",
        //     strength: 0.5,
        //     model: "sd3-turbo",
        // };
        console.log(formData)
        const response = await axios.post(
            `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
            formData,
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer `,
                    Accept: "image/*"
                },
            },
        );
        // console.log("respones is", response)
        if (response.status === 200) {
            fs.writeFileSync("./animeDiffusion3_0_85_sd3_p16.jpeg", Buffer.from(response.data));
            console.log("File generated")
            res.sendStatus(200);
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }

    } catch (err) {
        console.error("err on", err);
    }
})

app.post('/diffusion-firework-image-generation', async (req, res, next) => {

    // const binaryImageData = req.file ? req.file.buffer : req.body;
    // console.log(req.body, req.body.buffer, typeof Buffer.from(req.body).toString('base64'));
    // const buff = Buffer.from(req.body); // Node.js Buffer
    // const blob = new Blob([buff]); 
    // console.log(blob);
    // req.body.pipe(fs.createWriteStream("/uploads/image.jpeg"));

    const binaryData = await req.body;
    fs.writeFileSync("./uploadedImage.jpeg", binaryData);

    const initImage = new File(
        [fs.readFileSync("/Users/sanjaychandrasekaren/Documents/Projects/react/sampleProject/image-diffusion-poc/uploadedImage.jpeg")],
        "image.jpeg"
    );
    // const init_image = await fs.openAsBlob("/Users/sanjaychandrasekaren/Documents/Projects/react/sampleProject/image-diffusion-poc/image.jpeg");
    
    const formData = new FormData();
    formData.append("init_image", initImage, "image.jpg");
    formData.append("prompt", `Comic book illustration of a superhero avatar inspired by the uploaded picture. The subject has a confident, determined expression, heroic eyes, glowing skin. Their neatly groomed hair is swept back

Background: Bustling cityscape bathed in warm afternoon sunlight, towering skyscrapers, and streets teeming with people.

Subject Details: Powerful, athletic physique conveying strength and resilience. Strong, commanding posture radiating confidence. 

Capture the essence of the person in the picture, translating features into a superhero persona. Facial expression reflects a fighter's determination and unwavering resolve. 

Mimic the bold lines and dynamic compositions of classic comic book illustrations.`);
    formData.append("negative_prompt", "worst quality, bad eyes, bad anatomy, cropped, cross eyed, ugly, deformed, glitch, mutated, worst quality, unprofessional, low quality");
    formData.append("init_image_mode", "IMAGE_STRENGTH");
    formData.append("image_strength", "0.4");
    formData.append("cfg_scale", 40);
    formData.append("seed", 0);
    formData.append("steps", 25);
    formData.append("safety_check", false);

    const response = await fetch("https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image", {
        method: 'POST',
        headers: {
            'Accept': 'image/*',
            'Authorization': `Bearer `,
        },
        body: (formData),
    });
    // const response1 = await axios.post(
    //     `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image`,
    //     formData,
    //     {
    //         validateStatus: undefined,
    //         responseType: "arraybuffer",
    //         headers: {
    //             // Authorization: `Bearer `,
    //             Accept: "image/*"
    //         },
    //     },
    // );
    console.log(response, "res")

    if (response.status === 200) {
        const buffer = await response.arrayBuffer();
        //imageName_strength_cfg_steps_prompt
        fs.writeFile('fireworkDiffusion1_0_40_40_25_p.jpg', Buffer.from(buffer), () => console.log('finished downloading!'));
        res.sendStatus(200);
    } else {
        throw new Error(`${response.status}: ${response.body}`);
    }
})

app.listen(PORT, () => {
    console.log(`Server Works !!! At port ${PORT}`);
});