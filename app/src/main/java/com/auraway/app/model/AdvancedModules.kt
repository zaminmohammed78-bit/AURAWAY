package com.auraway.app.model

data class Flashcard(
    val id: String,
    val subject: String,
    val frontQuestion: String,
    val backAnswer: String,
    val isFavorite: Boolean = false
)

data class AttendanceRecord(
    val id: String,
    val date: String,
    val status: String // PRESENT, ABSENT, LEAVE
)

data class AcademicMark(
    val id: String,
    val subject: String,
    val examName: String,
    val marksObtained: Float,
    val totalMarks: Float,
    val grade: String
)

data class StudyGroup(
    val id: String,
    val groupName: String,
    val subject: String,
    val memberCount: Int,
    val description: String
)
