package com.example.sampleApp.features.VideoFeature;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public VideoEntity saveVideo(VideoEntity video) {
        return videoRepository.save(video);
    }

    public List<VideoEntity> getAllVideos() {
        return videoRepository.findAll();
    }

    public VideoEntity getVideoById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    public void deleteVideo(Long id) {
        videoRepository.deleteById(id);
    }
}
