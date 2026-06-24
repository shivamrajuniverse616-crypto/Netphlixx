package com.shivamraj.netphlixx.di

import com.shivamraj.netphlixx.data.DataRepository
import com.shivamraj.netphlixx.data.DefaultDataRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindDataRepository(
        defaultDataRepository: DefaultDataRepository
    ): DataRepository
}
