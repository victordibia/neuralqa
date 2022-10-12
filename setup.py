import os
from importlib.machinery import SourceFileLoader
from setuptools import setup, find_packages


version = SourceFileLoader('neuralqa.version', os.path.join(
    'neuralqa', 'version.py')).load_module().VERSION


def package_files(directory):
    paths = []
    for (path, _, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths


ui_files = package_files("neuralqa/server/ui/build")
yaml_file = ["config_default.yaml"]
setup(
    name='neuralqa',
    packages=find_packages(exclude=['tests', 'tests.*']),
    package_data={"neuralqa": ui_files + yaml_file},
    version=version,
    license='MIT',
    description='NeuralQA: Question Answering on Large Datasets',
    long_description=open('README.md').read(),
    long_description_content_type="text/markdown",
    author='Victor Dibia',
    url='https://github.com/victordibia/neuralqa',
    python_requires='>=3.5',
    # download_url='https://github.com/victordibia/neuralqa/archive/v0.0.2.tar.gz',
    keywords=['NLP', 'Question Answering', 'Machine Learning'],
    install_requires=[
        'fastapi',
        'aiofiles',
        'uvicorn',
        'numpy',
	'plac==0.9.6', 
        'tensorflow>=2.1.0',
        'torch',
        'torchvision',
        'transformers',
        'elasticsearch>=7.7.1',
        'pyyaml>=3.13',
        'spacy'
    ],
    extras_require={
        'test': ['pytest']
    },
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.6',
    ],
    entry_points={
        "console_scripts": [
            "neuralqa=neuralqa.cli:cli",
        ]
    }
)
