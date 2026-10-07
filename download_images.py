import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

images = {
    'banner1.jpg': 'https://images.pexels.com/photos/291732/pexels-photo-291732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'banner2.jpg': 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'service1.jpg': 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800',
    'service2.jpg': 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
    'service3.jpg': 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
}

for name, url in images.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as response, open(f'public/images/demo/studio/{name}', 'wb') as out_file:
        out_file.write(response.read())
    print(f"Downloaded {name}")
