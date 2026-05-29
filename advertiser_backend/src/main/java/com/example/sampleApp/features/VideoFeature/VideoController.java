package com.example.sampleApp.features.VideoFeature;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping
    public VideoEntity createVideo(@RequestBody VideoEntity video) {
        return videoService.saveVideo(video);
    }

    @GetMapping
    public List<VideoEntity> getVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/{id}")
    public VideoEntity getVideo(@PathVariable Long id) {
        return videoService.getVideoById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return "Video deleted";
    }
}
