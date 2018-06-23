#python 3.6

import os
import sys


def main(script,mySel,selectedText,begin,end,before,after) :

    mySel = open(mySel,"r")
    mySel = mySel.read().split(',')
    #print mySel

    for fileName in mySel:
        myDirname = os.path.dirname(fileName)
        myBaseName = os.path.basename(fileName)
        if end == "true":
            newBasename = ''.join(myBaseName.split(selectedText)) + selectedText
        elif begin == "true":
            newBasename = selectedText + ''.join(myBaseName.split(selectedText))

        newFileName = os.path.join(myDirname,newBasename)
        os.rename(fileName,newFileName)
        print ("{0} ===> {1}".format(myBaseName,newBasename))



if __name__ == '__main__':
            print (*sys.argv)
            main(*sys.argv)