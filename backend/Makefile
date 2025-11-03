IMAGE_URL = "https://vizwiz.cs.colorado.edu/VizWiz_visualization_img/VizWiz_train_00012786.jpg"
PROMPT = "What kind of chips are these?"
FOLDER_PATH = "./data/chips"

install:
	pip3 install -r requirements.txt

variations:
	mkdir -p $(FOLDER_PATH)
	python3 pipeline.py -u $(IMAGE_URL) -p $(PROMPT) -o $(FOLDER_PATH)
	mkdir -p $(FOLDER_PATH)/alignment
	mkdir -p $(FOLDER_PATH)/grouped
	python3 alignment.py -i $(FOLDER_PATH)
	mkdir -p $(FOLDER_PATH)/aggregated
	python3 aggregation.py -i $(FOLDER_PATH)

backend:
	python3 main.py

all: install backend

