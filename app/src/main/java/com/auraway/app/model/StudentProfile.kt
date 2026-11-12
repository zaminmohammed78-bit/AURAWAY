package com.auraway.app.model

data class StudentProfile(
    val id: String,
    val name: String,
    val avatarEmoji: String,
    val consistencyRate: Int, // e.g. 85%
    val isRoutineVisibleToTeacher: Boolean = false
)
