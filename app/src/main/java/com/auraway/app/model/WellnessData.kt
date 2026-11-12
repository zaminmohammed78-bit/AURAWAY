package com.auraway.app.model

data class WellnessData(
    val waterGlasses: Int = 5,
    val targetWaterGlasses: Int = 8,
    val selectedMood: String = "😊 Focused",
    val moodNotes: String = ""
)
