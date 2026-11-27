const sharp=require('sharp');sharp('public/assets/puget-v1/foliage.png').resize(512,512).webp({quality:85}).toFile('public/assets/prairie/foreground-shadow-v1.webp').then(x=>console.log(x));
