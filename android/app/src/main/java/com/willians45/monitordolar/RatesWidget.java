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
        
        // Intent to open the app (re-fetches automatically inside the app)
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_title, pendingIntent);

        // Refresh Intent is optional now, but let's keep it to manually re-read the cache if needed
        Intent refreshIntent = new Intent(context, RatesWidget.class);
        refreshIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        refreshIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(context, appWidgetId, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent);

        // Read purely from cache (which the App populates)
        android.content.SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
        String bcvStr = prefs.getString("last_bcv", "--");
        String binanceStr = prefs.getString("last_binance", "--");
        String euroStr = prefs.getString("last_euro", "--");
        String lastTime = prefs.getString("last_time", "Abre la app");

        views.setTextViewText(R.id.rate_usd_bcv, bcvStr);
        views.setTextViewText(R.id.rate_binance, binanceStr);
        views.setTextViewText(R.id.rate_eur_bcv, euroStr);
        
        if (bcvStr.equals("--")) {
            views.setTextViewText(R.id.widget_update_time, "Abre la App para conectar");
        } else {
            views.setTextViewText(R.id.widget_update_time, "Sincronizado: " + lastTime);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // Helper to update all instances (called from our Plugin)
    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        android.content.ComponentName thisWidget = new android.content.ComponentName(context, RatesWidget.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
