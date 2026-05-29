package com.example.sampleApp.features.ImageStore;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping
    public ImageEntity createImage(@RequestBody ImageEntity image) {
        return imageService.saveImage(image);
    }

    @GetMapping
    public List<ImageEntity> getImages() {
        return imageService.getAllImages();
    }

    @GetMapping("/{id}")
    public ImageEntity getImage(@PathVariable Long id) {
        return imageService.getImageById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteImage(@PathVariable Long id) {
        imageService.deleteImage(id);
        return "Image deleted";
    }
}
