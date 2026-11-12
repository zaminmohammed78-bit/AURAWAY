package com.auraway.app.model

enum class SubmitterType {
    STUDENT,
    PARENT
}

enum class ReasonTag(val label: String) {
    UNWELL("Unwell / Sick"),
    FAMILY_EVENT("Family Event / Emergency"),
    NEED_HELP("Need Academic Help"),
    OVERLAPPING_DEADLINE("Overlapping Deadlines"),
    OTHER("Other Reason")
}

data class ReasonSubmission(
    val submittedBy: SubmitterType,
    val reasonTag: ReasonTag,
    val note: String,
    val timestamp: Long = System.currentTimeMillis()
)
