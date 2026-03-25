package com.willians45.monitordolar;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONArray;
import org.json.JSONObject;

public class RatesWidget extends AppWidgetProvider {

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_rates);
        
        // Intent to open the app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_title, pendingIntent);

        // Refresh Intent
        Intent refreshIntent = new Intent(context, RatesWidget.class);
        refreshIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        refreshIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(context, appWidgetId, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent);

        // Indicate loading state initially
        views.setTextViewText(R.id.rate_usd_bcv, "...");
        views.setTextViewText(R.id.rate_eur_bcv, "...");
        views.setTextViewText(R.id.rate_binance, "...");
        views.setTextViewText(R.id.widget_update_time, "Actualizando...");
        appWidgetManager.updateAppWidget(appWidgetId, views);

        // Fetch Data Async
        executor.execute(() -> {
            try {
                android.content.SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
                String bcvStr = prefs.getString("last_bcv", "--");
                String binanceStr = prefs.getString("last_binance", "--");
                String euroStr = prefs.getString("last_euro", "--");
                String lastTime = prefs.getString("last_time", "--:--");

                boolean success = false;
                
                // Fetch all rates from Vercel API
                String jsonString = fetchUrl("https://monitor-dolar-venezuela-yxsa.vercel.app/api/rates");
                if (jsonString != null) {
                    try {
                        JSONObject json = new JSONObject(jsonString);
                        if (!json.has("error")) {
                            bcvStr = String.format(Locale.US, "%.2f", json.optDouble("bcv", 0));
                            binanceStr = String.format(Locale.US, "%.2f", json.optDouble("binance", 0));
                            euroStr = String.format(Locale.US, "%.2f", json.optDouble("euroBcv", 0));
                            success = true;
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                if (success) {
                    lastTime = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());
                    // Save to cache
                    prefs.edit()
                        .putString("last_bcv", bcvStr)
                        .putString("last_binance", binanceStr)
                        .putString("last_euro", euroStr)
                        .putString("last_time", lastTime)
                        .apply();
                }

                // Update UI on background thread (RemoteViews allows this)
                views.setTextViewText(R.id.rate_usd_bcv, bcvStr);
                views.setTextViewText(R.id.rate_binance, binanceStr);
                views.setTextViewText(R.id.rate_eur_bcv, euroStr);
                
                // Show if it's fresh or from cache
                views.setTextViewText(R.id.widget_update_time, (success ? "Act: " : "Cache: ") + lastTime);
                
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private static String fetchUrl(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            connection.setRequestProperty("Accept", "application/json");
            
            if (connection.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                return response.toString();
            } else {
                System.out.println("HTTP Error: " + connection.getResponseCode() + " for " + urlString);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
