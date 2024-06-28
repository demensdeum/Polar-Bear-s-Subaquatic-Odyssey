#!/usr/bin/env python3

import shutil
import cleanterminus
import subprocess
import os
import sys
from pathlib import Path

cleanterminus.clear()
os.chdir("client")
print("Building client...")
commandLine = "tools/build.py"
if "-quick" in sys.argv:
    commandLine = "tools/build.py -quick"
subprocess.run(commandLine, shell=True, check=True)
os.chdir("..")

cleanterminus.clear()
print("Deploying...")

print("Not official docker image, deploying...")
try:
    shutil.rmtree('/srv/http/Arctica')
except:
    pass
shutil.copytree('client', '/srv/http/Arctica/client/0', dirs_exist_ok=True)
shutil.copyfile('client/tools/cacheBuster/index.php', '/srv/http/Arctica/client/index.php')