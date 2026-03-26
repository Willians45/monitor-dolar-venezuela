package com.willians45.monitordolar;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetSync")
public class WidgetSyncPlugin extends Plugin {

    @PluginMethod
    public void syncRates(PluginCall call) {
        String bcv = call.getString("bcv", "--");
        String binance = call.getString("binance", "--");
        String euro = call.getString("euro", "--");
        String time = call.getString("time", "--:--");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
        prefs.edit()
             .putString("last_bcv", bcv)
             .putString("last_binance", binance)
             .putString("last_euro", euro)
             .putString("last_time", time)
             .apply();

        // Notify the widget to update immediately
        Intent intent = new Intent(context, RatesWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, RatesWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        call.resolve();
    }
}
