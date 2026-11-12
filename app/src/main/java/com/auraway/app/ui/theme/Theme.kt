package com.auraway.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.auraway.app.model.UserRole

@Composable
fun AuraWayTheme(
    role: UserRole = UserRole.STUDENT,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val primaryColor = if (role == UserRole.TEACHER) TeacherPrimaryLight else StudentPrimary
    val containerColor = if (role == UserRole.TEACHER) {
        if (darkTheme) TeacherContainerDark else TeacherContainerLight
    } else {
        if (darkTheme) StudentContainerDark else StudentContainerLight
    }

    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = primaryColor,
            secondary = if (role == UserRole.TEACHER) TeacherAccent else StudentAccent,
            primaryContainer = containerColor,
            background = DarkBackground,
            surface = DarkSurface,
            onPrimary = Color.White,
            onBackground = DarkTextPrimary,
            onSurface = DarkTextPrimary
        )
    } else {
        lightColorScheme(
            primary = primaryColor,
            secondary = if (role == UserRole.TEACHER) TeacherAccent else StudentAccent,
            primaryContainer = containerColor,
            background = LightBackground,
            surface = LightSurface,
            onPrimary = Color.White,
            onBackground = LightTextPrimary,
            onSurface = LightTextPrimary
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
