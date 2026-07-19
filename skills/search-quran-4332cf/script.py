import os
import json
import urllib.request
import urllib.parse

def main():
    try:
        inputs = json.loads(os.environ.get('INPUT_JSON', '{}'))
        keyword = inputs.get('keyword', '')
        if not keyword:
            print(json.dumps({"error": "Keyword is required"}))
            return

        encoded_keyword = urllib.parse.quote(keyword)
        url = f"http://api.alquran.cloud/v1/search/{encoded_keyword}/all/ar"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        if data.get("code") == 200:
            results = data["data"]["matches"]
            # return top 5
            top_matches = []
            for match in results[:5]:
                top_matches.append({
                    "surah": match["surah"]["name"],
                    "ayah_number": match["numberInSurah"],
                    "text": match["text"]
                })
            print(json.dumps({"matches": top_matches}))
        else:
            print(json.dumps({"error": "Failed to fetch data"}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
