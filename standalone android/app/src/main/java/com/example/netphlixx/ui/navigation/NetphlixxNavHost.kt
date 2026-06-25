package com.example.netphlixx.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.netphlixx.ui.details.DetailsScreen
import com.example.netphlixx.ui.home.HomeScreen
import com.example.netphlixx.ui.search.SearchScreen
import com.example.netphlixx.ui.watch.WatchScreen

@Composable
fun NetphlixxApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavigationBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") {
                HomeScreen(
                    onMovieClick = { id, type ->
                        navController.navigate("details/$id/$type")
                    }
                )
            }
            composable("search") {
                SearchScreen(
                    onMovieClick = { id, type ->
                        navController.navigate("details/$id/$type")
                    }
                )
            }
            composable(
                route = "watch/{id}/{type}",
                arguments = listOf(
                    navArgument("id") { type = NavType.IntType },
                    navArgument("type") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val id = backStackEntry.arguments?.getInt("id") ?: return@composable
                val type = backStackEntry.arguments?.getString("type") ?: "movie"
                WatchScreen(id = id, type = type)
            }
            composable("mylist") {
                com.example.netphlixx.ui.mylist.MyListScreen()
            }
            composable(
                route = "details/{id}/{type}",
                arguments = listOf(
                    navArgument("id") { type = NavType.IntType },
                    navArgument("type") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val id = backStackEntry.arguments?.getInt("id") ?: return@composable
                val type = backStackEntry.arguments?.getString("type") ?: "movie"
                DetailsScreen(
                    onPlay = { mediaId, mediaType ->
                        navController.navigate("watch/$mediaId/$mediaType")
                    },
                    onBack = { navController.popBackStack() },
                    onMovieClick = { newId, newType ->
                        navController.navigate("details/$newId/$newType")
                    }
                )
            }
        }
    }
}
