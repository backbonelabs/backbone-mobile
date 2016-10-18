package co.backbonelabs.backbone;

import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.mbientlab.metawear.AsyncOperation;
import com.mbientlab.metawear.Message;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.RouteManager;
import com.mbientlab.metawear.RouteManager.MessageHandler;
import com.mbientlab.metawear.UnsupportedModuleException;
import com.mbientlab.metawear.data.CartesianFloat;
import com.mbientlab.metawear.module.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;

import co.backbonelabs.backbone.util.Constants;

public class SensorDataService {
    public static final String INTENT_EXTRA_NAME = "co.backbonelabs.Backbone.sensorData";
    private static final String TAG = "SensorDataService";
    private static SensorDataService instance = null;
    private MetaWearBoard device = DeviceManagementService.mwBoard;
    private HashSet<ActivityModule> activeActivities = new HashSet<ActivityModule>();
    private HashSet<String> activeSensors = new HashSet<String>();

    /**
     * Instantiates, if necessary, and returns the singleton instance of SensorDataService.
     * Any consumers of SensorDataService should call this to retrieve a SensorDataService instance.
     * @return The singleton instance of SensorDataService
     */
    public static SensorDataService getInstance() {
        if (instance == null) {
            instance = new SensorDataService();
        }
        return instance;
    }

    // Private constructor prevents the class from being instantiated from the outside
    private SensorDataService() {
        // Register activity lifecycle callbacks to start and stop sensor activity streaming
        MainActivity.currentActivity.getApplication().registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            @Override
            public void onActivityCreated(Activity activity, Bundle savedInstanceState) {

            }

            @Override
            public void onActivityStarted(Activity activity) {

            }

            @Override
            public void onActivityResumed(Activity activity) {
                Log.d(TAG, "onActivityResume");
                // Stop foreground service
                Intent stopIntent = new Intent(activity, ForegroundService.class);
                stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
                activity.startService(stopIntent);
            }

            @Override
            public void onActivityPaused(Activity activity) {
                Log.d(TAG, "onActivityPaused");
                if (!activeSensors.isEmpty()) {
                    // There are active sensors, start foreground service to continue listening
                    Intent startIntent = new Intent(activity, ForegroundService.class);
                    startIntent.setAction(Constants.ACTIONS.START_POSTURE_FOREGROUND_SERVICE);
                    activity.startService(startIntent);
                }
            }

            @Override
            public void onActivityStopped(Activity activity) {

            }

            @Override
            public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

            }

            @Override
            public void onActivityDestroyed(Activity activity) {
                // App is terminated, perform cleanup tasks
                Log.d(TAG, "onActivityDestroyed");

                // Stop the foreground service
                Intent stopIntent = new Intent(activity, ForegroundService.class);
                stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
                activity.startService(stopIntent);

                // Stop active sensors
                if (!activeSensors.isEmpty()) {
                    stopAllSensors();
                }
            }
        });
    }

    /**
     * Registers an ActivityModule as active and attaches a data event handler to the appropriate
     * sensor if needed.
     * @param activityModule An ActivityModule to register to the collection of active activities
     */
    public void registerActivity(final ActivityModule activityModule) {
        Log.d(TAG, "registerActivity");

        // Add activity to the collection of active activities
        activeActivities.add(activityModule);

        // Ensure there are sensor data streams enabled for the activity's sensor(s)
        if (!activeSensors.contains(activityModule.getSensor())) {
            // There are currently no event handlers for the activity's required sensor,
            // so we will register an event handler with the sensor

            switch (activityModule.getSensor()) {
                case Constants.SENSORS.ACCELEROMETER:
                    Log.d(TAG, "Enabling accelerometer");
                    try {
                        Accelerometer accelerometer = device.getModule(Accelerometer.class);

                        // Set sampling frequency to 25Hz, as the Step Detection won't work below this value, at least on my Samsung J5
                        accelerometer.setOutputDataRate(Bmi160Accelerometer.OutputDataRate.ODR_25_HZ.frequency());

                        // Set sampling range to 2G
                        accelerometer.setAxisSamplingRange(Bmi160Accelerometer.AccRange.AR_2G.scale());

                        // Enable axis sampling
                        accelerometer.enableAxisSampling();

                        // Set up route data
                        accelerometer.routeData()
                                .fromAxes()
                                .stream("accelerometerStream")
                                .commit()
                                .onComplete(new AsyncOperation.CompletionHandler<RouteManager>() {
                                    @Override
                                    public void success(RouteManager result) {
                                        result.subscribe("accelerometerStream", new MessageHandler() {
                                            @Override
                                            public void process(Message msg) {
                                                CartesianFloat axes = msg.getData(CartesianFloat.class);
                                                Log.d(TAG, "axes data: " + axes.toString());

                                                HashMap<String, Float> data = new HashMap<String, Float>();
                                                data.put("x", axes.x());
                                                data.put("y", axes.y());
                                                data.put("z", axes.z());

                                                Intent intent = new Intent(activityModule.getNotificationName());
                                                intent.putExtra(INTENT_EXTRA_NAME, data);
                                                LocalBroadcastManager.getInstance(MainActivity.currentActivity)
                                                        .sendBroadcast(intent);
                                            }
                                        });
                                    }
                                });

                        accelerometer.start();

                        activeSensors.add(activityModule.getSensor());
                    } catch (UnsupportedModuleException e) {
                        Log.e(TAG, "Module not present", e);
                        activeActivities.remove(activityModule);
                    }
                    break;
                case Constants.SENSORS.BMI160ACCELEROMETER:
                    Log.d(TAG, "Enabling accelerometer");
                    try {
                        LocalNotificationManager.cancelScheduledNotification(activityModule.name);

                        LocalNotificationManager.scheduleNotification(activityModule.name);

                        Bmi160Accelerometer bmi160Accelerometer = device.getModule(Bmi160Accelerometer.class);

                        bmi160Accelerometer.enableStepDetection();

                        bmi160Accelerometer.routeData().fromStepDetection().stream("step_detector").commit()
                                .onComplete(new AsyncOperation.CompletionHandler<RouteManager>() {
                                    @Override
                                    public void success(RouteManager result) {
                                        Log.d(TAG, "Sub Step");
                                        result.subscribe("step_detector", new RouteManager.MessageHandler() {
                                            @Override
                                            public void process(Message msg) {
                                                Log.i(TAG, "Step Up " + String.valueOf(System.currentTimeMillis() / 1000L));
                                                Intent intent = new Intent(activityModule.getNotificationName());
                                                LocalBroadcastManager.getInstance(MainActivity.currentActivity)
                                                        .sendBroadcast(intent);
                                            }
                                        });
                                    }
                                });

                        bmi160Accelerometer.configureStepDetection().setSensitivity(Bmi160Accelerometer.StepSensitivity.ROBUST).commit();

                        // Add the sensor to the set of active sensors
                        bmi160Accelerometer.start();

                        activeSensors.add(activityModule.getSensor());
                    } catch (UnsupportedModuleException e) {
                        Log.e(TAG, "Module not present", e);
                        activeActivities.remove(activityModule);
                    }
                    break;
            }
        }
    }

    public void unregisterActivity(String activityName) {
        Log.d(TAG, "unregisterActivity " + activityName);

        // Remove the corresponding ActivityModule from activeActivities
        Iterator<ActivityModule> activeActivitiesIterator = activeActivities.iterator();
        while (activeActivitiesIterator.hasNext()) {
            ActivityModule activityModule = activeActivitiesIterator.next();
            if (activityModule.getName().equals(activityName)) {
                activeActivitiesIterator.remove();
            }
        }

        // Stop any sensors that are no longer needed for the remaining active activities
        Iterator<String> activeSensorsIterator = activeSensors.iterator();
        while (activeSensorsIterator.hasNext()) {
            String sensor = activeSensorsIterator.next();
            boolean isSensorUsed = false;
            activeActivitiesIterator = activeActivities.iterator();
            while (activeActivitiesIterator.hasNext()) {
                ActivityModule activityModule = activeActivitiesIterator.next();
                if (activityModule.getSensor().equals(sensor)) {
                    isSensorUsed = true;
                }
            }
            if (!isSensorUsed) {
                activeSensorsIterator.remove();
                toggleSensor(sensor, false);
            }
        }
    }

    private void toggleSensor(String sensor, boolean enable) {
        Log.d(TAG, "toggleSensor " + sensor + " " + enable);
        try {
            if (!device.isConnected()) {
                // Device is not connected, do not attempt to toggle sensor
                throw new Exception("Device is not connected");
            }

            switch (sensor) {
                case Constants.SENSORS.ACCELEROMETER:
                    Accelerometer accelerometer = device.getModule(Accelerometer.class);
                    if (enable) {
                        accelerometer.start();
                    } else {
                        accelerometer.stop();
                    }
                    break;
                case Constants.SENSORS.BMI160ACCELEROMETER:
                    LocalNotificationManager.cancelScheduledNotification(Constants.MODULES.STEP);

                    Bmi160Accelerometer bmi160Accelerometer = device.getModule(Bmi160Accelerometer.class);
                    if (enable) {
                        bmi160Accelerometer.start();
                    } else {
                        bmi160Accelerometer.stop();
                    }
                    break;
            }
        } catch (Exception e) {
            // Swallow exceptions to prevent app from crashing
            Log.e(TAG, "Error toggling " + sensor + " sensor", e);
        }
    }

    private void startAllSensors() {
        Log.d(TAG, "startAllSensors");
        Iterator<String> iterator = activeSensors.iterator();
        if (iterator.hasNext()) {
            String sensor = iterator.next();
            toggleSensor(sensor, true);
        }
    }

    private void stopAllSensors() {
        Log.d(TAG, "stopAllSensors");
        Iterator<String> iterator = activeSensors.iterator();
        if (iterator.hasNext()) {
            String sensor = iterator.next();
            toggleSensor(sensor, false);
        }
    }
}
