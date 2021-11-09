import torch
from torchvision import transforms
import imageio as io
from flask import Flask, send_from_directory, send_file, request, jsonify
from cnn import cnn
import random
import os
import spacy

app = Flask(__name__)

model = cnn()
model.load_state_dict(torch.load("model3epoch.ckpt"))
model.eval()

nlp = spacy.load("en_core_web_md")

# Path for our main Svelte page


@app.route("/")
def base():
    return send_from_directory('client/public', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)


@app.route("/<path:path>")
def home(path):
    return send_from_directory('client/public', path)


@app.route("/img/<path:path>")
def getImgs(path):
    return send_from_directory("img", path)


@app.route("/vec", methods=["POST"])
def getVec():
    req = request.json["sen"]
    return jsonify(list(nlp(req).vector.astype(float)))


@app.route("/counter", methods=["POST"])
def getCounter():
    file = request.files['file']
    names = file.filename.split(".")
    name = names[0] + "_counter." + names[1]
    destination = "./img/" + name
    file.save(destination)

    og = runModel(file.filename)
    mod = runModel(name)
    return jsonify({"name": name, "mod": mod, "og": og})


@app.route("/sample", methods=["POST"])
def getSample():
    file = request.files['file']
    names = file.filename.split(".")
    name = names[0] + "_sample." + names[1]
    destination = "./img/" + name
    file.save(destination)

    out = runModel(name)
    return jsonify({"name": name, "pred": out})


def runModel(img):
    image = io.imread("./img/" + img)
    trans = transforms.Compose([transforms.ToTensor()])
    image = trans(image)
    return str(round(model(image.unsqueeze(0)).item(), 2))


if __name__ == "__main__":
    # app.run(debug=True)
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
