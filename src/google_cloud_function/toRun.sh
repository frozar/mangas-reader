#!/bin/bash

function getListMangaPath() {
    curl -s https://lelscan.net/lecture-en-ligne-one-piece.php | grep "<option" | tail -n1 | sed "s/</\n</g;s/>/>\n/g" | grep "^<option" | cut -d"'" -f2 | cut -d"-" -f4- | cut -d"." -f1
}

function getMangaIdxChapter() {
    manga=$1
    # Use a temporary file to avoid to exceed the pipe capacity on google cloud function
    filename="/tmp/idxManga"
    curl -s https://lelscan.net/lecture-en-ligne-${manga}.php | grep "<option" >${filename}_tmp
    head -n1 ${filename}_tmp | sed "s/</\n</g;s/>/>\n/g" >${filename}
    idxChapter=$(grep '^[[:digit:]]\{1,\}' ${filename})
    declare -a arrayIdxChapter
    for i in $idxChapter; do
        arrayIdxChapter+=(${i})
    done
    nbElt=${#arrayIdxChapter[@]}
    jsonChapter=""
    for i in $(seq 0 $(($nbElt - 2))); do
        jsonChapter+="${arrayIdxChapter[$i]}, "
    done
    jsonChapter+="${arrayIdxChapter[$(($nbElt - 1))]}"
    echo "\"$manga\": [$jsonChapter]"
}

declare -a arrayJsonManga
for m in $(getListMangaPath); do
    res=$(getMangaIdxChapter $m)
    arrayJsonManga+=("$res")
done

echo "{"
nbElt=${#arrayJsonManga[@]}
for i in $(seq 0 $((nbElt - 2))); do
    echo "  ${arrayJsonManga[$i]},"
done
echo "  ${arrayJsonManga[$(($nbElt - 1))]}"
echo "}"
