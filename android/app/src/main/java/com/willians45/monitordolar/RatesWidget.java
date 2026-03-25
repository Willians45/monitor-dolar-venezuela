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
                String bcvStr = "--";
                String binanceStr = "--";
                String euroStr = "--";

                // Fetch Dolares
                String dolarJson = fetchUrl("https://ve.dolarapi.com/v1/dolares");
                if (dolarJson != null) {
                    JSONArray dolares = new JSONArray(dolarJson);
                    for (int i = 0; i < dolares.length(); i++) {
                        JSONObject obj = dolares.getJSONObject(i);
                        String fuente = obj.optString("fuente");
                        double promedio = obj.optDouble("promedio", 0);
                        if ("oficial".equals(fuente)) {
                            bcvStr = String.format(Locale.US, "%.2f", promedio);
                        } else if ("paralelo".equals(fuente)) {
                            binanceStr = String.format(Locale.US, "%.2f", promedio);
                        }
                    }
                }

                // Fetch Euros
                String euroJson = fetchUrl("https://ve.dolarapi.com/v1/euros");
                if (euroJson != null) {
                    JSONArray euros = new JSONArray(euroJson);
                    for (int i = 0; i < euros.length(); i++) {
                        JSONObject obj = euros.getJSONObject(i);
                        if ("oficial".equals(obj.optString("fuente"))) {
                            euroStr = String.format(Locale.US, "%.2f", obj.optDouble("promedio", 0));
                            break;
                        }
                    }
                }

                // Update UI on background thread (RemoteViews allows this)
                views.setTextViewText(R.id.rate_usd_bcv, bcvStr);
                views.setTextViewText(R.id.rate_binance, binanceStr);
                views.setTextViewText(R.id.rate_eur_bcv, euroStr);
                views.setTextViewText(R.id.widget_update_time, "Act: " + new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()));
                
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } catch (Exception e) {
                e.printStackTrace();
                views.setTextViewText(R.id.widget_update_time, "Error al actualizar");
                appWidgetManager.updateAppWidget(appWidgetId, views);
            }
        });
    }

    private static String fetchUrl(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            if (connection.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                return response.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
