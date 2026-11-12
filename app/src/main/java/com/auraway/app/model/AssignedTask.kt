package com.auraway.app.model

enum class TaskStatus {
    PENDING,
    DONE,
    REASON_SUBMITTED,
    EXCUSED,
    EXTENDED
}

data class AssignedTask(
    val id: String,
    val title: String,
    val subject: String,
    val dueDate: String,
    val instructions: String,
    val assignedToStudentId: String?, // null means assigned to all students
    val status: TaskStatus = TaskStatus.PENDING,
    val reasonSubmission: ReasonSubmission? = null,
    val extendedDueDate: String? = null
)
