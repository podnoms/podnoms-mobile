package expo.modules.podnomsauto

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import java.io.File
import java.io.FileNotFoundException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

// Serves artwork to Android Auto, which only loads content:// images in its
// lists. Each image is named by a hash of its URL, and only URLs the app has
// listed (uriFor) are fetched, so other apps can't use this to load anything.
class AutoArtworkProvider : ContentProvider() {
  companion object {
    private const val DIRECTORY = "auto-artwork"

    // A content:// address for an https image, which this provider downloads
    // on first use and keeps in the cache.
    fun uriFor(context: Context, url: String): Uri {
      val name = hash(url)
      val known = File(directory(context), "$name.url")
      if (!known.exists()) known.writeText(url)
      return Uri.Builder()
        .scheme("content")
        .authority("${context.packageName}.auto.artwork")
        .appendPath(name)
        .build()
    }

    private fun directory(context: Context) = File(context.cacheDir, DIRECTORY).apply { mkdirs() }

    private fun hash(url: String) =
      MessageDigest.getInstance("SHA-1").digest(url.toByteArray()).joinToString("") { "%02x".format(it) }
  }

  override fun onCreate() = true

  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor {
    val context = context ?: throw FileNotFoundException()
    val name = uri.lastPathSegment?.takeIf { it.matches(Regex("[0-9a-f]{40}")) } ?: throw FileNotFoundException()
    val dir = directory(context)
    val image = File(dir, name)
    if (!image.exists()) {
      val url = File(dir, "$name.url").takeIf { it.exists() }?.readText() ?: throw FileNotFoundException()
      download(url, image)
    }
    return ParcelFileDescriptor.open(image, ParcelFileDescriptor.MODE_READ_ONLY)
  }

  private fun download(url: String, to: File) {
    val connection = URL(url).openConnection() as HttpURLConnection
    try {
      connection.connectTimeout = 10_000
      connection.readTimeout = 10_000
      if (connection.responseCode !in 200..299) throw FileNotFoundException(url)
      val partial = File(to.parentFile, "${to.name}.part")
      connection.inputStream.use { input -> partial.outputStream().use { input.copyTo(it) } }
      partial.renameTo(to)
    } finally {
      connection.disconnect()
    }
  }

  override fun getType(uri: Uri) = "image/*"

  override fun query(
    uri: Uri,
    projection: Array<out String>?,
    selection: String?,
    selectionArgs: Array<out String>?,
    sortOrder: String?
  ): Cursor? = null

  override fun insert(uri: Uri, values: ContentValues?): Uri? = null

  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?) = 0

  override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?) = 0
}
