package com.example.sampleApp.features.ImageStore;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    public ImageEntity saveImage(ImageEntity image) {
        return imageRepository.save(image);
    }

    public List<ImageEntity> getAllImages() {
        return imageRepository.findAll();
    }

    public ImageEntity getImageById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));
    }

    public void deleteImage(Long id) {
        imageRepository.deleteById(id);
    }
}
