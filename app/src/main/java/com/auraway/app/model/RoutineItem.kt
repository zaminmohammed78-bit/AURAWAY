package com.auraway.app.model

enum class RoutineStatus {
    PENDING,
    COMPLETED,
    MISSED
}

data class RoutineItem(
    val id: String,
    val title: String,
    val timeSlot: String,
    val category: String, // e.g. Morning, Study, Fitness, Night
    val status: RoutineStatus = RoutineStatus.PENDING
)
