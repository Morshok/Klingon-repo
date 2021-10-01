package klingon.webserver;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;


/**
 * This class acts as a way of configuring
 * the scheduling services used to schedule
 * updates of the database.
 *
 *  @author Anthon Lenander
 *  @version 2021-09-23
 */
@Configuration
@EnableAsync
@EnableScheduling
class SchedulingConfiguration implements AsyncConfigurer
{
    // Number of tasks to run in parallel,
    // Which would be 2 for our purposes.
    // Increase THREAD_COUNT by one for
    // every additionally added tasks.
    private static final int THREAD_COUNT = 3;

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler()
    {
        ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();
        threadPoolTaskScheduler.setPoolSize(THREAD_COUNT);
        return threadPoolTaskScheduler;
    }

    @Override
    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor getAsyncExecutor()
    {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        threadPoolTaskExecutor.setCorePoolSize(THREAD_COUNT);
        threadPoolTaskExecutor.setMaxPoolSize(THREAD_COUNT);
        threadPoolTaskExecutor.setQueueCapacity(THREAD_COUNT);
        threadPoolTaskExecutor.initialize();
        return threadPoolTaskExecutor;
    }
}