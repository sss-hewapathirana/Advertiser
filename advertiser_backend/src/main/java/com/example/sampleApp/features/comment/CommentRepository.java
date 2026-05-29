package com.example.sampleApp.features.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    Page<CommentEntity> findByAd_AdInfoIdAndParentIsNullOrderByCreatedAtDesc(Long adInfoId, Pageable pageable);

    List<CommentEntity> findByAd_AdInfoIdAndParent_IdOrderByCreatedAtAsc(Long adInfoId, Long parentId);

    List<CommentEntity> findByAd_AdInfoIdAndParentIsNotNullOrderByCreatedAtAsc(Long adInfoId);
}
