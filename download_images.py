import urllib.request
import ssl
import os

ssl._create_default_https_context = ssl._create_unverified_context

images = {
    'banner1.jpg': 'https://images.pexels.com/photos/5475043/pexels-photo-5475043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'banner2.jpg': 'https://images.pexels.com/photos/731022/pexels-photo-731022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'service1.jpg': 'https://images.pexels.com/photos/8106987/pexels-photo-8106987.jpeg?auto=compress&cs=tinysrgb&w=800',
    'service2.jpg': 'https://images.pexels.com/photos/6604245/pexels-photo-6604245.jpeg?auto=compress&cs=tinysrgb&w=800',
    'service3.jpg': 'https://images.pexels.com/photos/8252277/pexels-photo-8252277.jpeg?auto=compress&cs=tinysrgb&w=800',
}

os.makedirs('public/images/demo/pet', exist_ok=True)

for name, url in images.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as response, open(f'public/images/demo/pet/{name}', 'wb') as out_file:
        out_file.write(response.read())
    print(f"Downloaded {name}")
