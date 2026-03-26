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
            boolean success = false;
            String debugMsg = "Ok";
            try {
                android.content.SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
                String bcvStr = prefs.getString("last_bcv", "--");
                String binanceStr = prefs.getString("last_binance", "--");
                String euroStr = prefs.getString("last_euro", "--");
                String lastTime = prefs.getString("last_time", "--:--");

                // Fetch Dolares
                String dolarJson = fetchUrl("https://ve.dolarapi.com/v1/dolares");
                if (dolarJson != null && !dolarJson.startsWith("ERROR_HTTP")) {
                    try {
                        JSONArray dolares = new JSONArray(dolarJson);
                        for (int i = 0; i < dolares.length(); i++) {
                            JSONObject obj = dolares.getJSONObject(i);
                            String fuente = obj.optString("fuente");
                            double promedio = obj.optDouble("promedio", 0);
                            if ("oficial".equals(fuente)) {
                                bcvStr = String.format(Locale.US, "%.2f", promedio);
                                success = true;
                            } else if ("paralelo".equals(fuente)) {
                                binanceStr = String.format(Locale.US, "%.2f", promedio);
                            }
                        }
                    } catch (Exception e) {
                        debugMsg = "PARSE_USD: " + e.getMessage();
                    }
                } else {
                    debugMsg = (dolarJson != null) ? dolarJson : "USD_NULL";
                }

                // Fetch Euros
                String euroJson = fetchUrl("https://ve.dolarapi.com/v1/euros");
                if (euroJson != null && !euroJson.startsWith("ERROR_HTTP")) {
                    try {
                        JSONArray euros = new JSONArray(euroJson);
                        for (int i = 0; i < euros.length(); i++) {
                            JSONObject obj = euros.getJSONObject(i);
                            if ("oficial".equals(obj.optString("fuente"))) {
                                euroStr = String.format(Locale.US, "%.2f", obj.optDouble("promedio", 0));
                                break;
                            }
                        }
                    } catch (Exception e) {
                        debugMsg = "PARSE_EUR: " + e.getMessage();
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
                views.setTextViewText(R.id.widget_update_time, (success ? "Act: " : "Err: " + debugMsg + " | Cache: ") + lastTime);
                
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } catch (Exception e) {
                views.setTextViewText(R.id.widget_update_time, "Crash: " + e.getMessage());
                appWidgetManager.updateAppWidget(appWidgetId, views);
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
            
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                return response.toString();
            } else {
                return "ERROR_HTTP_" + responseCode;
            }
        } catch (Exception e) {
            return "ERROR_HTTP_EX: " + e.getMessage();
        }
    }
}
