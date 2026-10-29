# PAWOMI — Shopify Online Store 2.0 Tema v1.0

Tifil.co yaklaşımıyla Liquid + JSON template + section/snippet + asset mimarisi.

## Kurulum
1. Tema klasörünün **içeriğini** ZIP olarak paketleyin veya Shopify CLI `shopify theme dev` / `shopify theme push --unpublished` kullanın.
2. Shopify Admin > Online Store > Themes > Add theme > Upload ZIP; önizlemede test edin.
3. Theme editor: Banner, kategoriler, koleksiyon kartları, öne çıkan ürün koleksiyonu, e-bülten metni ve fotoğrafları değiştirin.
4. Shopify'da koleksiyonlarınızı (kopek, kedi gibi) ve sayfalarınızı açıp uygun şablonları atayın.
5. Menü bağlantılarını Shopify Navigation'dan ayarlayın.
6. Shopify Settings > Policies, Payments, Shipping/Delivery, Customer accounts bölümlerini iş/ülke gereksinimlerine göre tamamlayın.

## Gerçek entegrasyon
Ürün, koleksiyon, sepet, arama, blog, müşteri iletişimi ve newsletter gerçek Shopify Liquid objeleri/formlarıyla bağlıdır. Checkout Shopify'ın kendi güvenli checkout ekranına devredilir; tema içinden bağımsız checkout taklidi yoktur.

## Bilinen sınırlar
- Görseller ve logonun wordmark temsili geçici: marka görsellerini `image_picker` ile değiştirebilirsiniz.
- Favoriler, sipariş takip uygulaması, kullanıcı hesabı, ödeme, güvenlik ve yasal metinlerin nihai kurulumu mağaza ayarlarına/app'lere bağlıdır.
- Bu paket Shopify canlı mağazada henüz yüklenip test edilmemiştir.
- Ürün mini formunda hızlı ekleme ilk uygun varyantı sepete ekler; çok varyantlı ürünlerde ürün detayından seçim yapılmalıdır.
- Shopify theme check ve gerçek mağaza önizlemesinde QA yapılmalıdır.
